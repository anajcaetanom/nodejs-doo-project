const db = require('../config/database');
const { ImgurClient } = require('imgur');
const dotenv = require('dotenv');
const { createReadStream } = require('fs');
const exp = require('constants');

exports.getAllProducts = async (req, res) => {
    if (req.query.hasOwnProperty('limit') && req.query.hasOwnProperty('offset') || 'login' in req.body) {

        if (login) {
            try {
                const getAllProductsQuery = await db.query(
                    "SELECT * FROM produtos WHERE usuarios_login = $1",
                    [login]
                );
                if (getAllProductsQuery.rows.length !== 0) {
                    res.status(200).send(
                        {
                            sucesso : 1,
                            produtos : getAllProductsQuery.rows,
                            qtde_produtos : getAllProductsQuery.rows.length
                        }
                    );
                }
            }
            catch (err) {
                var errorMsg = "erro BD: ";-
                    res.status(200).send(
                        {
                            sucesso : 0,
                            cod_erro : 2,
                            erro : errorMsg.concat(err)
                        }
                    );
            }

        } else {
            const { limit, offset } = req.query;

            try {
                const getAllProductsQuery = await db.query(
                    "SELECT * FROM produtos LIMIT $1 OFFSET $2",
                    [limit, offset]
                );

                if (getAllProductsQuery.rows.length !== 0) {
                    res.status(200).send(
                        {
                            sucesso : 1,
                            produtos : getAllProductsQuery.rows,
                            qtde_produtos : getAllProductsQuery.rows.length
                        }
                    );
                }

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

exports.addProduct = async (req, res) => {
    if ('nome' in req.body && 'preco' in req.body && 'descricao' in req.body 
    && req.hasOwnProperty('file')) {
        const { nome, preco, descricao } = req.body;

        const imgurClient = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });
        const imgurRes = await imgurClient.upload(
            {
                image: createReadStream(req.file.path),
                type: 'stream'
            }
        );

        if (imgurRes.status === 200) {
            try {
                const addProductQuery = await db.query(
                    "INSERT INTO produtos(nome, preco, descricao, img, usuarios_login) VALUES($1, $2, $3, $4, $5)",
                    [nome, preco, descricao, imgurRes.data.link, req.auth.user]
                );
                res.status(200).send(
                    {
                        sucesso : 1
                    }
                );
            }
            catch(err) {
                var erroMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : erroMsg.concat(err)
                    }
                );
            }
        }
        else {
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 2,
                    erro : "erro IMGUR: falha ao subir imagem para o IMGUR"
                }
            );
        }
    }
    else {
        var erroMsg = "faltam parametros";
		res.status(200).send(
			{
				sucesso : 0,
				cod_erro : 3,
				erro : erroMsg
			}
		);
    }
};

exports.getProductDetails = async (req, res) => {
    if ('id' in req.query) {
        const { id } = req.query;
        try {
            const getProductDetailsQuery = await db.query(
                "SELECT * FROM produtos WHERE id = $1",
                [id]
            );

            if (getProductDetailsQuery.rows.length !== 0) {
                res.status(200).send(
                    {
                        sucesso : 1,
                        nome : getProductDetailsQuery.rows[0]['nome'],
                        preco : getProductDetailsQuery.rows[0]['preco'],
                        descricao : getProductDetailsQuery.rows[0]['descricao'],
                        criado_por : getProductDetailsQuery.rows[0]['usuarios_login'],
                        criado_em : getProductDetailsQuery.rows[0]['criado_em'],
                        img : getProductDetailsQuery.rows[0]['img']
                    }
                );

            } else {
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : "produto não encontrado"
                    }
                );
            }

        } catch(err) {
            var erroMsg = "erro BD: ";
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 2,
                    erro : erroMsg.concat(err)
                }
            );
        }
    } else {
        var erroMsg = "faltam parametros";
        res.status(200).send(
            {
                sucesso : 0,
                cod_erro : 3,
                erro : erroMsg
            }
        );
    }
};

exports.updateProduct = async (req, res) => {
    if ('id' in req.body && 'novo_nome' in req.body || 'novo_preco' in req.body 
        || 'nova_descricao' in req.body || req.hasOwnProperty('nova_img')) {
        
        const { id, novo_nome, novo_preco, nova_descricao } = req.body;
        
        if (novo_nome) {
            try {
                const updateProductQuery = await db.query(
                    "UPDATE produtos SET nome = $1 WHERE id = $2",
                    [novo_nome, id]
                );
            } 
            catch (err) {
                var erroMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : erroMsg.concat(err)
                    }
                );
            }
        };

        if (novo_preco) {
            try {
                const updateProductQuery = await db.query(
                    "UPDATE produtos SET preco = $1 WHERE id = $2",
                    [novo_preco, id]
                );
            } 
            catch (err) {
                var erroMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : erroMsg.concat(err)
                    }
                );
            }
        };

        if (nova_descricao) {
            try {
                const updateProductQuery = await db.query(
                    "UPDATE produtos SET descricao = $1 WHERE id = $2",
                    [nova_descricao, id]
                );
            } 
            catch (err) {
                var erroMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : erroMsg.concat(err)
                    }
                );
            }
        };

        const imgurClient = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });
        const imgurRes = await imgurClient.upload(
            {
                image: createReadStream(req.file.path),
                type: 'stream'
            }
        );
        if (imgurRes.status === 200) {
            try {
                const updateProductQuery = await db.query(
                    "UPDATE produtos SET img = $1 WHERE id = $2",
                    [imgurRes.data.link, id]
                );
            } 
            catch (err) {
                var erroMsg = "erro BD: ";
                res.status(200).send(
                    {
                        sucesso : 0,
                        cod_erro : 2,
                        erro : erroMsg.concat(err)
                    }
                );
            }
        }

        
    } else {
        var erroMsg = "faltam parametros";
        res.status(400).send(
            {
                sucesso : 0,
                cod_erro : 3,
                erro : erroMsg
            }
        );
    }
};

exports.deleteProduct = async (req, res) => {
    if ('id' in req.body) {
        const { id } = req.body;
        const {login} = req.auth.user;

        try {
            const deleteProductQuery = await db.query(
                "DELETE FROM produtos WHERE id = $1 AND usuarios_login = $2",
                [id, login]
            );
            res.status(200).send(
                {
                    sucesso : 1
                }
            );
        } 
        catch (err) {
            var erroMsg = "erro BD: ";
            res.status(200).send(
                {
                    sucesso : 0,
                    cod_erro : 2,
                    erro : erroMsg.concat(err)
                }
            );
        }
    } else {
        var erroMsg = "faltam parametros";
        res.status(200).send(
            {
                sucesso : 0,
                cod_erro : 3,
                erro : erroMsg
            }
        );
    }
};