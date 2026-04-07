-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('EXPENSE', 'INCOME', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('COMPLETED', 'FAILED', 'REFUND');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD', 'TRAVEL', 'SHOPPING', 'BILLS', 'ENTERTAINMENT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawSms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawSms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawSmsId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TxType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "merchant" TEXT,
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "confidence" DOUBLE PRECISION NOT NULL,
    "isAiParsed" BOOLEAN NOT NULL DEFAULT false,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "manualCorrection" BOOLEAN NOT NULL DEFAULT false,
    "status" "TxStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RawSms_hash_key" ON "RawSms"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_rawSmsId_key" ON "Transaction"("rawSmsId");

-- AddForeignKey
ALTER TABLE "RawSms" ADD CONSTRAINT "RawSms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_rawSmsId_fkey" FOREIGN KEY ("rawSmsId") REFERENCES "RawSms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
