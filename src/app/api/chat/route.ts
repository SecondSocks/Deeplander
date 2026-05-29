import { AiChatService } from '../../../features/chat/ai-chat.service'
import { DeepseekProvider } from '../../../modules/ai/providers/deepseek.provider'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const provider = new DeepseekProvider()

		const chatService = new AiChatService(provider)

		const response = await chatService.sendMessage(body.message)

		return Response.json(response)
	} catch (error) {
		console.error(error)

		return Response.json(
			{
				error: 'Internal server error'
			},
			{
				status: 500
			}
		)
	}
}
