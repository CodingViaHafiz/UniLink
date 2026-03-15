import EnrollmentNumber from "../models/EnrollmentNumber.js";

// ─── Admin: Add a single enrollment number ───────────────────────────────────

export const addEnrollmentNumber = async (req, res) => {
  try {
    const { enrollmentNumber, department, program, batch } = req.body;

    if (!enrollmentNumber?.trim() || !department?.trim() || !program?.trim() || !batch?.trim()) {
      return res.status(400).json({
        message: "Enrollment number, department, program, and batch are all required.",
      });
    }

    const normalized = enrollmentNumber.trim().toUpperCase();

    const existing = await EnrollmentNumber.findOne({ enrollmentNumber: normalized });
    if (existing) {
      return res.status(409).json({ message: `Enrollment number "${normalized}" already exists.` });
    }

    const record = await EnrollmentNumber.create({
      enrollmentNumber: normalized,
      department: department.trim(),
      program: program.trim(),
      batch: batch.trim().toUpperCase(),
    });

    return res.status(201).json({ message: "Enrollment number added.", record });
  } catch {
    return res.status(500).json({ message: "Failed to add enrollment number." });
  }
};

// ─── Admin: Bulk add enrollment numbers ──────────────────────────────────────
// Expects body: { records: [{ enrollmentNumber, department, program, batch }, ...] }

export const bulkAddEnrollmentNumbers = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Provide a non-empty array under 'records'." });
    }
    if (records.length > 500) {
      return res.status(400).json({ message: "Maximum 500 records per bulk import." });
    }

    const normalized = records.map((r) => ({
      enrollmentNumber: r.enrollmentNumber?.trim().toUpperCase(),
      department: r.department?.trim(),
      program: r.program?.trim(),
      batch: r.batch?.trim().toUpperCase(),
    }));

    // Validate each record
    for (const r of normalized) {
      if (!r.enrollmentNumber || !r.department || !r.program || !r.batch) {
        return res.status(400).json({
          message: `Each record must have enrollmentNumber, department, program, and batch. Invalid record: ${JSON.stringify(r)}`,
        });
      }
    }

    // insertMany with ordered:false continues on duplicates
    const result = await EnrollmentNumber.insertMany(normalized, {
      ordered: false,
      rawResult: true,
    });

    return res.status(201).json({
      message: `Bulk import done.`,
      inserted: result.insertedCount,
      total: records.length,
    });
  } catch (err) {
    // Partial success with duplicates
    if (err.code === 11000 || err.name === "BulkWriteError") {
      const inserted = err.result?.nInserted ?? 0;
      const duplicates = records.length - inserted;
      return res.status(207).json({
        message: `Import completed with ${duplicates} duplicate(s) skipped.`,
        inserted,
        duplicates,
      });
    }
    return res.status(500).json({ message: "Bulk import failed." });
  }
};

// ─── Admin: Get all enrollment numbers ───────────────────────────────────────

export const getEnrollmentNumbers = async (req, res) => {
  try {
    const { isUsed, batch, department } = req.query;
    const filter = {};

    if (isUsed !== undefined) filter.isUsed = isUsed === "true";
    if (batch) filter.batch = batch.toUpperCase();
    if (department) filter.department = { $regex: department, $options: "i" };

    const records = await EnrollmentNumber.find(filter)
      .populate("usedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ records });
  } catch {
    return res.status(500).json({ message: "Failed to fetch enrollment numbers." });
  }
};

// ─── Admin: Delete an enrollment number (only if unused) ─────────────────────

export const deleteEnrollmentNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await EnrollmentNumber.findById(id);

    if (!record) return res.status(404).json({ message: "Record not found." });
    if (record.isUsed) {
      return res.status(400).json({
        message: "Cannot delete an enrollment number that is already in use.",
      });
    }

    await record.deleteOne();
    return res.status(200).json({ message: "Enrollment number deleted." });
  } catch {
    return res.status(500).json({ message: "Failed to delete enrollment number." });
  }
};
