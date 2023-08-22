import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authUser } from '@/service/utils/auth';
import { withNextCors } from '@/service/utils/tools';
import { connectToDatabase, KB } from '@/service/mongo';

export type QuoteItemType = {
  id: string;
  q: string;
  a: string;
  source?: string;
};
type Props = {
  name: string,
  tags: string[],
  // appId: string;
};
type Response = string;

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { userId } = await authUser({ req });

    if (!userId) {
      throw new Error('userId is empty');
    }

    const { name, tags } = req.body as Props;

    if (!name) {
      throw new Error('params is error');
    }

    // auth model
    // const { model } = await authModel({
    //   modelId: appId,
    //   userId
    // });

    await connectToDatabase();

    const result = await create({
      // model,
      userId,
      name,
      tags
    })

    jsonRes<Response>(res, {
      data: result
    });
  } catch (err) {
    console.log(err);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});

export async function create({
  // model,
  userId,
  name,
  tags,
}: {
  // model: ModelSchema;
  userId: string;
  name: string;
  tags: string[];
}): Promise<Response> {
  
  await connectToDatabase();

  const { _id } = await KB.create({
    name,
    userId,
    tags
  });

  return _id
}
