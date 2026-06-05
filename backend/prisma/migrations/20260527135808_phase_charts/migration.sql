-- CreateTable
CREATE TABLE "PhaseChart" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,

    CONSTRAINT "PhaseChart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhaseChart_phaseId_chartId_key" ON "PhaseChart"("phaseId", "chartId");

-- AddForeignKey
ALTER TABLE "PhaseChart" ADD CONSTRAINT "PhaseChart_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseChart" ADD CONSTRAINT "PhaseChart_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
