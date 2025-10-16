const express = require("express");
const mongoose = require("mongoose");
// const bcrypt = require('bcryptjs');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware es la función que se ejecuta antes de llegar a las rutas
app.use(express.json());
app.use(cors());

// Conexión a la base de datos MongoDB

const mongoURI =
  "mongodb+srv://joserodriguezblanco_db_user:7Q6ehGCr6Q4z0isL@cluster0.ioijnwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error de conexion a MongoDB:", err));

// Esquema y modelo de usuario

const userSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  imagen: { type: String, required: true },
  editorial: { type: String, required: true },
  description: { type: String, required: true },
});

const User = mongoose.model("bibliotec", userSchema);

//Rutas API
//Ruta Registro del usuario

app.post("/register", async (req, res) => {
  try {
    
    const { title, author, isbn, imagen, editorial, description } = req.body;
    if (!title || !author || !isbn || !imagen || !editorial || !description) {
      return res
        .status(400)
        .json({
          message:
            "Todos los datos del libro son obligatorios: " +
            title +
            author +
            isbn +
            imagen +
            editorial +
            description,
        });
    }
    const book = new User({
      title,
      author,
      isbn,
      imagen,
      editorial,
      description,
    });
    await book.save();

    res.status(201).json({ message: "Libro registrado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear el libro", error: error.message });
  }
});

//Ruta Login del usuario

app.post("/view", async (req, res) => {
  try {
    
    const books = await User.find({}).sort({ createdAt: -1 }).lean();

    return res.status(201).json({
      message: "Libros cargados exitosamente",
      books,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar libro", error: error.message });
  }
});


app.post("/book", async (req, res) => {
  try {
    
    const { isbn } = req.body;


    if (!isbn) {
      return res.status(400).json({ message: "El ISBN es obligatorio" });
    }
    const book = await User.findOne({ isbn }).select("-__v").lean();

    return res.status(201).json({
      message: "Libros cargados exitosamente",
      book,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar libro", error: error.message });
  }
});

app.delete('/book/:isbn', async (req, res) => {
  try {
    let { isbn } = req.params;
    if (!isbn) return res.status(400).json({ message: 'El ISBN es obligatorio' });
    isbn = String(isbn).trim().replace(/-/g, '');

    const deleted = await User.findOneAndDelete({ isbn });
    if (!deleted) {
      return res.status(404).json({ message: 'No se encontró un libro con ese ISBN' });
    }

    return res.status(200).json({ message: 'Libro eliminado exitosamente', book: deleted });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    return res.status(500).json({ message: 'Error al eliminar libro', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
