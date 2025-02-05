const read = async (Model, req, res) => {
  const { id } = req.params;
console.log("listAll")
  try {
    const result = await Model.findById(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving entry: ' + error.message,
    });
  }
};

module.exports = read;
