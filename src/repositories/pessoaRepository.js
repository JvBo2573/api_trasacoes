const pool = require('../config/db');

const buscaPorEmail = async(email,conexao_exclusiva = pool) => {
    const sql = 'SELECT * FROM pessoas WHERE email = $1';
    const resultado = await conexao_exclusiva.query(sql, [email]);
    return resultado.rows[0];
};

module.exports = { buscaPorEmail };