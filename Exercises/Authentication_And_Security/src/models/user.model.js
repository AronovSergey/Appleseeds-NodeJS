const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is invalid");
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 7,
		validate(value) {
			if (value.toLowerCase().includes("password")) {
				throw new Error('Password cannot contain "password"');
			}
		},
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error("Age must be a postive number");
			}
		},
	},
});

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await userModel.findOne({ email });

	if (!user) {
		throw new Error("unable to login");
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error("unable to login");
	}

	return user;
};

userSchema.pre("save", async function (next) {
	const user = this;

	if (!user.isModified("password")) return next();

	user.password = await bcrypt.hash(user.password, 8);

	next();
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
