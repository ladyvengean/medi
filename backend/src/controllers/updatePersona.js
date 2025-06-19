///DELETED
import User from '../models/user.models.js';

export const updatePersona = async (req, res) => {
  try {
    const { name, age, diseases, medications, allergies, lastVisit } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        persona: {
          name,
          age,
          diseases,
          medications,
          allergies,
          lastVisit
        }
      },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Patient persona updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating persona:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
