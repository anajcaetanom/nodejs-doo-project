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

exports.updateUser = async (req, res) => {
    if (req.body.hasOwnProperty('novo_nome') || req.body.hasOwnProperty('novo_email')) {

        const {novo_nome, novo_email} = req.body;
        const {login} = req.auth.user;

        if (novo_nome) {
            try {
                const updateNameQuery = await db.query (
                    "UPDATE usuarios SET nome=$1 WHERE login=$2",
                    [novo_nome, login]
                );

                res.status(200).send(
                    {
                        sucesso : 1
                    }
                );
            
            } catch (err) {
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

        if (novo_email) {
            try {
                const updateEmailQuery = await db.query (
                    "UPDATE usuarios SET email=$1 WHERE login=$2",
                    [novo_email, login]
                );
                res.status(200).send(
                    {
                        sucesso : 1
                    }
                );

            } catch (err) {
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
        
    } else {
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

exports.changePassword = async (req, res) => {
    if (req.body.hasOwnProperty('nova_senha')) {
        const {nova_senha} = req.body;
        const {login} = req.auth.user;

        var token = bcrypt.hash(nova_senha);

        try {
            const updatePasswordQuery = await db.query (
                "UPDATE usuarios SET token=$1 WHERE login=$2",
                [token, login]
            );

            res.status(200).send(
                {
                    sucesso : 1
                }
            );
        } catch (err) {
            var errorMsg = "erro BD: ";
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 2,
                    erro : errorMsg.concat(err)
                }
            );
        }
    } else {
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

exports.deleteUser = async (req, res) => {
    const {login} = req.auth.user;

    try {
        const deleteUserQuery = await db.query (
            "DELETE FROM usuarios WHERE login=$1",
            [login]
        );

        res.status(200).send(
            {
                sucesso : 1
            }
        );
    } catch (err) {
        var errorMsg = "erro BD: ";
        res.status(200).send(
            {
                sucesso : 0,
                cod_erro : 2,
                erro : errorMsg.concat(err)
            }
        );
    }
};

exports.getUserDetails = async (req, res) => {
    const {login} = req.params;
    
    if (login) {
        try {
            const getUserQuery = await db.query (
                "SELECT nome, email FROM usuarios WHERE login=$1",
                [login]
            );

            res.status(200).send(
                {
                    sucesso : 1,
                    nome : getUserQuery.rows[0]['nome'],
                    email : getUserQuery.rows[0]['email']
                }
            );
        } catch (err) {
            var errorMsg = "erro BD: ";
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 2,
                    erro : errorMsg.concat(err)
                }
            );
        }
    } else {
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