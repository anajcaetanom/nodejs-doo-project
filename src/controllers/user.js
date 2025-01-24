const db = require('../config/database');
const bcrypt = require('node-php-password');

exports.registerUser = async (req, res) => {
    if (req.body.hasOwnProperty('novo_login') && req.body.hasOwnProperty('nova_senha') &&
        req.body.hasOwnProperty('nome') && req.body.hasOwnProperty('email')) {
        
        const {novo_login, nova_senha, nome, email} = req.body;

        var token = bcrypt.hash(nova_senha);

        const hasUserQuery = await db.query (
            "SELECT login FROM usuarios WHERE login=$1",
            [novo_login]
        );

        if (hasUserQuery.rows.length === 0) {
            try {
                const insertUserQuery = await db.query (
                    "INSERT INTO usuarios (login, token, nome, email) VALUES ($1, $2, $3, $4)",
                    [novo_login, token, nome, email]
                );

                res.status(200).send(
                    {
                        sucesso : 1
                    }
                );
            }
            catch (err) {
                var errorMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : errorMsg.concat(err)
                    }
                );
            }
        }
        else {
            var errorMsg = "usuario ja cadastrado";
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 1,
                    erro : errorMsg
                }
            );
        }
    }
    else {
        var errorMsg = "faltam parametros";
        res.status(200).send(
            {
                sucesso : 0,
                cod_erro : 3,
                erro : errorMsg
            }
        );
    }

};

export.updateUser = async