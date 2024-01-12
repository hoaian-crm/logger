import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import { compile } from 'handlebars';
import { join } from 'path';
import { parse } from 'stacktrace-parser';

@Injectable()
export class MattermostService {
  private templates = {}
  constructor() {
    const dir = join(__dirname, "templates");
    const files = readdirSync(dir);
    files.map((fileName: string) => {
      const fileDir = join(dir, fileName);
      const file = readFileSync(fileDir, 'utf8');
      this.templates[fileName] = compile(file);
    })
  }

  async sendMessage(text: string) {
    return await fetch(process.env.MATTERMOST_WEB_HOOK, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendUnknownMessage(message: any) {
    return await this.sendMessage(`
@all **Message chưa được định nghĩa:**
\`\`\`console
hoaian@log
${JSON.stringify(message, null, 2)}
\`\`\`
    `);
  }

  async unCatchError(error: Error) {
    const root = parse(error.stack || "")[0];
    const githubUrl = process.env.npm_package_repository_url.replace(".git", "/") + "blob/master";
    const gitFileDir = githubUrl + root.file.replace(process.cwd(), "") + "#L" + root.lineNumber;

    // https://github.com/hoaian-crm/tag-service/blob/master/src/app.module.ts#L9
    return await this.sendMessage(this.templates['un_catch.hbs']({
      error: error.stack,
      service: process.env.npm_package_name + " - " + process.env.npm_package_version,
      githubUrl: gitFileDir
    }));
  }
}
