import { Injectable } from '@nestjs/common';

@Injectable()
export class MattermostService {
  constructor() {}

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
\`\`\`json
${JSON.stringify(message, null, 2)}
\`\`\`
    `);
  }

  async unCatchError(error: any) {
    console.log(JSON.stringify(error), error.stack);
    return await this.sendMessage(`
@all **Có lỗi xảy ra chưa được xử lí:**
\`\`\`bash
${error.stack}
\`\`\`
`);
  }
}
