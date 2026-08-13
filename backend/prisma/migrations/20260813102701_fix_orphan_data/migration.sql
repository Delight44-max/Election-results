-- CreateTable
CREATE TABLE "states" (
    "state_id" INTEGER NOT NULL,
    "state_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("state_id")
);

-- CreateTable
CREATE TABLE "lga" (
    "uniqueid" SERIAL NOT NULL,
    "lga_id" INTEGER NOT NULL,
    "lga_name" VARCHAR(50) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "lga_description" TEXT,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3),
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "lga_pkey" PRIMARY KEY ("uniqueid")
);

-- CreateTable
CREATE TABLE "ward" (
    "uniqueid" SERIAL NOT NULL,
    "ward_id" INTEGER NOT NULL,
    "ward_name" VARCHAR(50) NOT NULL,
    "lga_id" INTEGER NOT NULL,
    "ward_description" TEXT,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3),
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "ward_pkey" PRIMARY KEY ("uniqueid")
);

-- CreateTable
CREATE TABLE "polling_unit" (
    "uniqueid" SERIAL NOT NULL,
    "polling_unit_id" INTEGER NOT NULL,
    "ward_id" INTEGER NOT NULL,
    "lga_id" INTEGER NOT NULL,
    "uniquewardid" INTEGER,
    "polling_unit_number" VARCHAR(50),
    "polling_unit_name" VARCHAR(255),
    "polling_unit_description" TEXT,
    "lat" VARCHAR(255),
    "long" VARCHAR(255),
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3),
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "polling_unit_pkey" PRIMARY KEY ("uniqueid")
);

-- CreateTable
CREATE TABLE "party" (
    "id" SERIAL NOT NULL,
    "partyid" VARCHAR(11) NOT NULL,
    "partyname" VARCHAR(50) NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentname" (
    "name_id" SERIAL NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "pollingunit_uniqueid" INTEGER,

    CONSTRAINT "agentname_pkey" PRIMARY KEY ("name_id")
);

-- CreateTable
CREATE TABLE "announced_lga_results" (
    "result_id" SERIAL NOT NULL,
    "lga_id" INTEGER NOT NULL,
    "party_abbreviation" VARCHAR(10) NOT NULL,
    "party_score" INTEGER NOT NULL,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3) NOT NULL,
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "announced_lga_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "announced_pu_results" (
    "result_id" SERIAL NOT NULL,
    "polling_unit_uniqueid" INTEGER NOT NULL,
    "party_abbreviation" VARCHAR(10) NOT NULL,
    "party_score" INTEGER NOT NULL,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3) NOT NULL,
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "announced_pu_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "announced_state_results" (
    "result_id" SERIAL NOT NULL,
    "state_name" VARCHAR(50) NOT NULL,
    "party_abbreviation" VARCHAR(10) NOT NULL,
    "party_score" INTEGER NOT NULL,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3) NOT NULL,
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "announced_state_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "announced_ward_results" (
    "result_id" SERIAL NOT NULL,
    "ward_name" VARCHAR(50) NOT NULL,
    "party_abbreviation" VARCHAR(10) NOT NULL,
    "party_score" INTEGER NOT NULL,
    "entered_by_user" VARCHAR(50),
    "date_entered" TIMESTAMP(3) NOT NULL,
    "user_ip_address" VARCHAR(50),

    CONSTRAINT "announced_ward_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lga_lga_id_key" ON "lga"("lga_id");

-- CreateIndex
CREATE INDEX "lga_state_id_idx" ON "lga"("state_id");

-- CreateIndex
CREATE INDEX "ward_lga_id_idx" ON "ward"("lga_id");

-- CreateIndex
CREATE INDEX "polling_unit_lga_id_idx" ON "polling_unit"("lga_id");

-- CreateIndex
CREATE INDEX "polling_unit_uniquewardid_idx" ON "polling_unit"("uniquewardid");

-- CreateIndex
CREATE UNIQUE INDEX "party_partyid_key" ON "party"("partyid");

-- CreateIndex
CREATE INDEX "agentname_pollingunit_uniqueid_idx" ON "agentname"("pollingunit_uniqueid");

-- CreateIndex
CREATE INDEX "announced_lga_results_lga_id_idx" ON "announced_lga_results"("lga_id");

-- CreateIndex
CREATE INDEX "announced_lga_results_party_abbreviation_idx" ON "announced_lga_results"("party_abbreviation");

-- CreateIndex
CREATE INDEX "announced_pu_results_polling_unit_uniqueid_idx" ON "announced_pu_results"("polling_unit_uniqueid");

-- CreateIndex
CREATE INDEX "announced_pu_results_party_abbreviation_idx" ON "announced_pu_results"("party_abbreviation");

-- AddForeignKey
ALTER TABLE "lga" ADD CONSTRAINT "lga_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ward" ADD CONSTRAINT "ward_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "lga"("lga_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_unit" ADD CONSTRAINT "polling_unit_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "lga"("lga_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_unit" ADD CONSTRAINT "polling_unit_uniquewardid_fkey" FOREIGN KEY ("uniquewardid") REFERENCES "ward"("uniqueid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentname" ADD CONSTRAINT "agentname_pollingunit_uniqueid_fkey" FOREIGN KEY ("pollingunit_uniqueid") REFERENCES "polling_unit"("uniqueid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announced_lga_results" ADD CONSTRAINT "announced_lga_results_lga_id_fkey" FOREIGN KEY ("lga_id") REFERENCES "lga"("lga_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announced_pu_results" ADD CONSTRAINT "announced_pu_results_polling_unit_uniqueid_fkey" FOREIGN KEY ("polling_unit_uniqueid") REFERENCES "polling_unit"("uniqueid") ON DELETE RESTRICT ON UPDATE CASCADE;
