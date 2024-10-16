import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandler(async (req, res) => {
    // Here, you might want to add your registration logic
    res.status(200).json({ message: "REGISTERED USER !!" });
});

export { registerUser };
