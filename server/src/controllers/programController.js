import Program from "../models/Program.js";

const toResponse = (program) => ({
  id: program._id,
  name: program.name,
  code: program.code,
  totalSemesters: program.totalSemesters,
  semesters: program.semesters
    .map((s) => ({
      number: s.number,
      courses: s.courses
        .map((c) => ({
          id: c._id,
          courseName: c.courseName,
          courseCode: c.courseCode,
          theoryCredits: c.theoryCredits,
          labCredits: c.labCredits,
          type: c.type,
          order: c.order,
        }))
        .sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => a.number - b.number),
  electivePool: program.electivePool.map((e) => ({
    id: e._id,
    courseName: e.courseName,
    courseCode: e.courseCode,
    theoryCredits: e.theoryCredits,
    labCredits: e.labCredits,
  })),
  createdAt: program.createdAt,
});

export const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    return res.status(200).json({ programs: programs.map(toResponse) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch programs.", error: error.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { name, code, totalSemesters } = req.body;

    if (!name || !code || !totalSemesters) {
      return res
        .status(400)
        .json({ message: "Name, code, and totalSemesters are required." });
    }

    const program = await Program.create({
      name,
      code,
      totalSemesters,
      semesters: [],
      electivePool: [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Program created successfully.",
      program: toResponse(program),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to create program.", error: error.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, totalSemesters } = req.body;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    if (name) program.name = name;
    if (code) program.code = code;
    if (totalSemesters) program.totalSemesters = totalSemesters;

    await program.save();

    return res.status(200).json({
      message: "Program updated successfully.",
      program: toResponse(program),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to update program.", error: error.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    await program.deleteOne();
    return res.status(200).json({ message: "Program deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete program.", error: error.message });
  }
};

export const updateSemesterCourses = async (req, res) => {
  try {
    const { id, semNumber } = req.params;
    const { courses } = req.body;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    const semIndex = program.semesters.findIndex(
      (s) => s.number === Number(semNumber)
    );

    if (semIndex >= 0) {
      program.semesters[semIndex].courses = courses;
    } else {
      program.semesters.push({ number: Number(semNumber), courses });
    }

    await program.save();

    return res.status(200).json({
      message: "Semester courses updated successfully.",
      program: toResponse(program),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({
        message: "Failed to update semester courses.",
        error: error.message,
      });
  }
};

export const updateElectivePool = async (req, res) => {
  try {
    const { id } = req.params;
    const { electives } = req.body;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    program.electivePool = electives;

    await program.save();

    return res.status(200).json({
      message: "Elective pool updated successfully.",
      program: toResponse(program),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({
        message: "Failed to update elective pool.",
        error: error.message,
      });
  }
};
