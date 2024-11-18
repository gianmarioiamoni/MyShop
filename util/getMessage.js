const getMessage = (req, msgKey) => {
    let messageArr = req.flash(msgKey);
    let message = null;
    if (messageArr.length > 0) {
        message = messageArr[0];
    }
    return message;
}

module.exports = getMessage;