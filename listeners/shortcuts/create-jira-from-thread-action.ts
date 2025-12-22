import type {
  AllMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
} from '@slack/bolt';

const createJiraFromThreadAction = async ({ ack, body, client, respond, logger }: AllMiddlewareArgs & SlackShortcutMiddlewareArgs) => {
  try {
    await ack();

    if (body.type !== 'message_action') {
      return;
    }
  
    const channel = body.channel.id;
    const message = body.message;
    const threadTs = message.thread_ts ?? message.ts;

    const replies = await client.conversations.replies({
      channel,
      ts: threadTs,
      limit: 100,
    });
    
    if (!replies.ok || !replies.messages?.length) {
      await respond({
        text: 'Could not read the thread.',
        response_type: 'ephemeral',
      });
      return;
    }

    if (replies.messages.length === 1) {
      await respond({
        text: 'The thread has only one message. Please add more context before creating a Jira ticket.',
        response_type: 'ephemeral',
      });
      return;
    }

    await respond({
      text: `🧵 Found ${replies.messages.length} messages. Creating Jira ticket…`,
      thread_ts: threadTs,
    });

    // TODO: LLM + Jira
     
  } catch (error) {
    logger.error('createJiraFromThreadAction failed', error);

    await respond({
      text: '❌ Failed to create Jira ticket.',
      response_type: 'ephemeral',
    });
  }
};

export { createJiraFromThreadAction };
