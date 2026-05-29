/*
  Warnings:

  - You are about to drop the column `last_message_at` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `system_prompt_version` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `token_count` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userSettingsId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Conversation_last_message_at_idx";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "last_message_at",
DROP COLUMN "model",
DROP COLUMN "provider",
DROP COLUMN "state",
DROP COLUMN "system_prompt_version",
ADD COLUMN     "defaultModel" TEXT NOT NULL DEFAULT 'deepseek-v4-flash',
ADD COLUMN     "defaultProvider" TEXT NOT NULL DEFAULT 'deepseek',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "systemPromptVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "token_count",
ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "latencyMs" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "totalTokens" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userSettingsId";
