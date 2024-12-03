const fs = require('fs');

const deleteFile = async filePath => {
    try {
        await fs.promises.unlink(filePath);
        return;
    } catch (err) {
        throw(err);
    }
}

module.exports = {
    deleteFile: deleteFile
};