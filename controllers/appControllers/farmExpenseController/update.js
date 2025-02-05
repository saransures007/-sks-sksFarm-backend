const update = async (Model, req, res) => {
  const { id } = req.params;
  req.body.lastUpdated = Date.now();
  try {
    const result = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully updated Total Milk Production entry.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating entry: ' + error.message,
    });
  }
};

module.exports = update;
