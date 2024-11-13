const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
    vendedor_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    items: [{
        producto_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Producto'
        },
        cantidad_solicitada: {
            type: Number,
            required: true
        }
    }],
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'en_progreso', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    asignado_a: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: {
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    }
});


const Pedido = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;