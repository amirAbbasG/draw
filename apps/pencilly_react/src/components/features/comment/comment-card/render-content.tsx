import React from "react";

import AppTypo from "@/components/ui/custom/app-typo";
import { User } from "@/services/user";

export function renderContent(content: string, mentions: User[]) {
  return content.split(/({{[^}]+}})/g).map((part, i) => {
    const match = part.match(/{{([^}]+)}}/);
    if (match) {
      const username = match[1];
      const mention = mentions.find(m => m.username === username);
      if (mention) {
        return (
          <AppTypo
            type="span"
            variant="small"
            color="primary"
            key={i}
            className="mention"
          >
            @{mention.username}
          </AppTypo>
        );
      }
    }
    return part;
  });
}
