const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const studentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Store a securely hashed password, never a plain-text password.
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const clubSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const membershipSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent a student from joining the same club more than once.
membershipSchema.index({ student: 1, club: 1 }, { unique: true });

const eventSchema = new Schema(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

const surveyQuestionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "single_choice", "multiple_choice"],
      required: true,
    },
    options: {
      type: [String],
      default: [],
      // Validate choice questions have options.
      validate: {
        validator: function (options) {
          return (
            !["single_choice", "multiple_choice"].includes(this.type) ||
            options.length > 0
          );
        },
        message: "Choice questions must have at least one option.",
      },
    },
    required: { type: Boolean, default: false },
  },
  { _id: true }
);

const surveySchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true, // At most one survey per event.
    },
    title: { type: String, required: true, trim: true },
    questions: {
      type: [surveyQuestionSchema],
      default: [],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "A survey must have at least one question.",
      },
    },
  },
  { timestamps: true }
);

const surveyAnswerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        // Text answer: string; choice answer: string or string[].
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    { _id: false }
);

const surveyResponseSchema = new mongoose.Schema(
    {
        survey: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survey",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        answers: {
            type: [surveyAnswerSchema],
            required: true,
            validate: {
                validator: (answers) => answers.length > 0,
                message: "A response must contain at least one answer.",
            },
        },
    },
    { timestamps: true }
);

// One submission per student per survey.
surveyResponseSchema.index({ survey: 1, student: 1 }, { unique: true });



module.exports = {
  Student: model("Student", studentSchema),
  Club: model("Club", clubSchema),
  Membership: model("Membership", membershipSchema),
  Event: model("Event", eventSchema),
  Survey: model("Survey", surveySchema),
  SurveyResponse: model("SurveyResponse", surveyResponseSchema),
};
