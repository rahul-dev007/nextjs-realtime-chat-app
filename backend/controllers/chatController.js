// fetch messages for a chatId
exports.getMessages = async (req, res) => {
const { chatId } = req.params;
const messages = await Message.find({ chatId }).sort('createdAt').populate('sender', 'name email');
res.json({ messages });
};


// save message (if you want REST fallback)
exports.createMessage = async (req, res) => {
const { chatId, content } = req.body;
const message = await Message.create({ chatId, content, sender: req.user.id });
res.status(201).json({ message });
};