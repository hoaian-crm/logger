import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { parse } from 'stacktrace-parser';

@Injectable()
export class MattermostService {
  private templates = {}
  constructor() {

    const dir = join(__dirname, "templates");
    const files = readdirSync(dir);
    Handlebars.registerHelper('json', (context: any) => JSON.stringify(context))
    files.map((fileName: string) => {
      const fileDir = join(dir, fileName);
      const file = readFileSync(fileDir, 'utf8');
      this.templates[fileName] = Handlebars.compile(file);
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
    return await this.sendMessage(this.templates['un_known.hbs']({
      message
    }));
  }

  async unCatchError(error: Error) {
    // if (process.env.NODE_ENV === 'local') return; // Ignore send to mattermost if local
    let gitFileDir = "";
    if (process.env.NODE_ENV !== "local") {
      const gitBranch = process.env['BRANCHES.' + process.env.NODE_ENV]
      const root = parse(error.stack || "")[0];
      const githubUrl = process.env.npm_package_repository_url.replace(".git", "/") + "blob/" + gitBranch;
      gitFileDir = githubUrl + root.file.replace(process.cwd(), "") + "#L" + root.lineNumber;
    }
    return await this.sendMessage(this.templates['un_catch.hbs']({
      error: error.stack,
      service: process.env.npm_package_name + " - " + process.env.npm_package_version,
      githubUrl: gitFileDir
    }));
  }
}
