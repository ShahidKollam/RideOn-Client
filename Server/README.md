# RideOn Backend

Production-ready backend for RideOn campus bike rental platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Build Prisma schema:
   ```bash
   npm run build-schema
   ```

4. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Seed database:
   ```bash
   npm run prisma:seed
   ```

6. Start server:
   ```bash
   npm start
   ```

## Testing
```bash
npm test
```

## API Documentation
See `src/docs/` directory.
