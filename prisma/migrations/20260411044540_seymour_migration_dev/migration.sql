-- CreateTable
CREATE TABLE "algorithm" (
    "id" SERIAL NOT NULL,
    "data" JSONB,
    "w" JSONB NOT NULL,
    "i" INTEGER NOT NULL,
    "j" INTEGER NOT NULL,
    "y_pred" INTEGER NOT NULL,
    "s" INTEGER NOT NULL,
    "neuron" INTEGER NOT NULL,
    "epoch" INTEGER NOT NULL,
    "error" INTEGER NOT NULL,
    "isTrained" BOOLEAN NOT NULL,

    CONSTRAINT "algorithm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "algorithm_delta" (
    "id" SERIAL NOT NULL,
    "data" JSONB,
    "w" JSONB NOT NULL,
    "i" INTEGER NOT NULL,
    "j" INTEGER NOT NULL,
    "k" INTEGER NOT NULL,
    "y_pred" JSONB NOT NULL,
    "s" JSONB NOT NULL,
    "epsilon" JSONB NOT NULL,
    "eta" DOUBLE PRECISION NOT NULL,
    "epoch" INTEGER NOT NULL,
    "error" INTEGER NOT NULL,
    "isTrained" BOOLEAN NOT NULL,

    CONSTRAINT "algorithm_delta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "algorithm_id" INTEGER,
    "algorithm_delta_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researchTab" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "researchTab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "research_algorithm_id_key" ON "research"("algorithm_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_algorithm_delta_id_key" ON "research"("algorithm_delta_id");

-- CreateIndex
CREATE UNIQUE INDEX "researchTab_research_id_key_key" ON "researchTab"("research_id", "key");

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_algorithm_id_fkey" FOREIGN KEY ("algorithm_id") REFERENCES "algorithm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_algorithm_delta_id_fkey" FOREIGN KEY ("algorithm_delta_id") REFERENCES "algorithm_delta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researchTab" ADD CONSTRAINT "researchTab_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
