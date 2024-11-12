import { Schema, model, models } from "mongoose";

const productoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true
    },
    codigo_barras: {
      type: String,
      required: true,
      unique: true
    },
    imagen_url: {
      type: String,
      default: "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
    },
    cantidad_disponible: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
  }
);

export default models.Producto || model("Producto", productoSchema);