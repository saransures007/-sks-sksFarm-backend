const remove = async (Model, req, res) => {
  const { id } = req.params;

  try {
    const result = await Model.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted Total Milk Production entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting entry: ' + error.message,
    });
  }
};

module.exports = remove;
