export const markdownToHtml = (text: string): string => {
	let result = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

	// code blocks — до inline code
	result = result.replace(
		/```\w*\n?([\s\S]*?)```/g,
		'<pre><code>$1</code></pre>'
	)

	// inline code
	result = result.replace(/`([^`\n]+)`/g, '<code>$1</code>')

	// bold
	result = result.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>')

	// italic
	result = result.replace(/\*(.+?)\*/gs, '<i>$1</i>')

	// headers → bold
	result = result.replace(/^#{1,6}\s+(.+)$/gm, '<b>$1</b>')

	return result
}
