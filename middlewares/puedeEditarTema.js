const getDB = require('../bbdd/db');

const puedeEditarTema = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        const { idTema } = req.params;
        const {idUsuario} = req.body;

        const [propietario] = await connection.query(
            `SELECT id_usuario FROM temas WHERE id = ?;`,
            [idTema]
        );

        // Si no soy el propietario de la entrada y no soy administrador
        // no puedo editar.
        if (propietario[0].id_usuario !==idUsuario) {
            const error = new Error(
                'No tienes permisos para editar esta entrada'
            );
            error.httpStatus = 401;
            throw error;
        }

        next();
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = puedeEditarTema;

