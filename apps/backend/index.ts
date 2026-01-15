import express from 'express';

import cors from 'cors';
import { router } from './routes/routes';
const PORT = process.env.BACKEND_PORT
const app = express();

app.use(express.json());

app.use(cors());
app.use('/api/v1', router);

app.listen(PORT, () => {
    console.log("Backend is running on port", PORT);
})

