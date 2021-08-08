import monk from 'monk';

const connection = monk(process.env.MONGO_URI);

export { connection };
