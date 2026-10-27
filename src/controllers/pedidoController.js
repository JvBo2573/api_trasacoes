const pool = require('../config/db');
const produtoRepository = require('../repositories/produtoRepository');
const pedidoRepository = require('../repositories/pedidoRepository');

const criarPedido = async (req, res) => {
    const pessoa_id = req.usuario_id;
    const { produto_id, quantidade_solicitada } = req.body;
    const conexao_exclusiva = await pool.connect();

    try {
        await conexao_exclusiva.query('BEGIN');
        const produto = await produtoRepository.buscaPorId(produto_id, conexao_exclusiva);

        if (!produto) {
            throw new Error('Produto não encontrado');
        }
        if (produto.quantidade_estoque < quantidade_solicitada) {
            throw new Error('Estoque induficiente');
        }

        // ==============================================================
        // TESTE DO CAOS: Descomente a linha abaixo para testar o ROLLBACK
        throw new Error('Falha simulada no banco de dados!');
        // ==============================================================

        await produtoRepository.atualizarEstoque(produto_id, quantidade_solicitada, conexao_exclusiva)
        const novoPedido = await pedidoRepository.criar(pessoa_id, produto_id, quantidade_solicitada, conexao_exclusiva);
        await conexao_exclusiva.query('COMMIT');

        res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido: novoPedido });

    } catch (erro) {
        await conexao_exclusiva.query('ROLLBACK');
        res.status(400).json({ erro: erro.message });
    } finally {
        conexao_exclusiva.release();
    }

};

module.exports = { criarPedido };