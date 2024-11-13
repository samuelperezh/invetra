
const mongoose = require('mongoose');
const UsuarioSchema = require('./schemas/UsuarioSchema');
const ProductoSchema = require('./schemas/ProductoSchema');
const PedidoSchema = require('./schemas/PedidoSchema');

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
const Producto = mongoose.models.Producto || mongoose.model('Producto', ProductoSchema);
const Pedido = mongoose.models.Pedido || mongoose.model('Pedido', PedidoSchema);

module.exports = {
    Usuario,
    Producto,
    Pedido
};