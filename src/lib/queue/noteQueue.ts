import { Note } from '@/types';
import Queue from 'bull';

const QUEUE_NAME = 'noteProcessing';

const noteQueue = new Queue<Note>(QUEUE_NAME, process.env.REDIS_URL!);

export const addNoteToQueue = async (note: Note) => {
  await noteQueue.add(note, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

export default noteQueue;