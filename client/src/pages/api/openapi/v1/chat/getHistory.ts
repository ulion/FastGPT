// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authUser } from '@/service/utils/auth';
import { connectToDatabase, ChatItem } from '@/service/mongo';
import { Types } from 'mongoose';
import type { ChatItemType } from '@/types/chat';

export type Props = {
  chatId?: string;
  limit?: number;
};
export type Response = { history: ChatItemType[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { userId } = await authUser({ req });
    const { chatId, limit } = req.body as Props;

    jsonRes<Response>(res, {
      data: await getChatHistory({
        chatId,
        userId,
        limit
      })
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

export async function getChatHistory({
  chatId,
  userId,
  limit = 30
}: Props & { userId: string }): Promise<Response> {
  if (!chatId) {
    return { history: [] };
  }

  const history = await ChatItem.aggregate([
    {
      $match: {
        chatId,
        userId: new Types.ObjectId(userId)
      }
    },
    {
      $sort: {
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $project: {
        dataId: 1,
        obj: 1,
        value: 1
      }
    }
  ]);

  history.reverse();

  return { history };
}
