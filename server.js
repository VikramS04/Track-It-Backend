import express from 'express';
import { connectDb } from './src/db/dbConnection.js';
import { configDotenv } from 'dotenv';

configDotenv();
connectDb();