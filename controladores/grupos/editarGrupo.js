const getDB = require("../../bbdd/db");

const editarGrupo = async (req, res, next) => {
  let connection;

  try {
    connection = await getDB();

    const { idGrupo } = req.params;
    const { titulo } = req.body;
    const { idUsuario } = req.usuarioAutorizado;

    const [propietario] = await connection.query(
      `
            select id_usuario from grupos where id = ?;
            `,
      [idGrupo]
    );

    if (propietario[0].id_usuario !== idUsuario) {
      const error = new Error("No puedes editar este grupo");
      error.httpStatus = 401;
      throw error;
    }

    if (!titulo) {
      const error = new Error("Faltan campos");
      error.httpStatus = 400;
      throw error;
    }

    const now = new Date();

    await connection.query(
      `
            update grupos set titulo = ?, fecha_modificacion = ? where id = ?;
            `,
      [titulo, now, idGrupo]
    );

    res.send({
      status: "ok",
      data: {
        id: idGrupo,
        titulo,
        fecha_modificacion: now,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = editarGrupo;
