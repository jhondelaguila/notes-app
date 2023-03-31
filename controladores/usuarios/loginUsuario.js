const getDB = require("../../bbdd/db");
const jwt = require("jsonwebtoken");

const loginUsuario = async (req, res, next) => {
  let connection;

  try {
    connection = await getDB();

    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Faltan campos");
      error.httpStatus = 400;
      throw error;
    }
    const [usuario] = await connection.query(
      `SELECT * FROM usuarios WHERE email = ? AND contraseña = SHA2(?, 512);`,
      [email, password]
    );

    // Si no existe el usuario...
    if (usuario.length < 1) {
      const error = new Error("Email o contraseña incorrectos");
      error.httpStatus = 401;
      throw error;
    }

    // Si existe pero no está activo...
    if (usuario[0].activo === 0) {
      const error = new Error("Usuario pendiente de validar");
      error.httpStatus = 401;
      throw error;
    }
    // Creamos un objeto con información que le pasaremos al token.
    const tokenInfo = {
      idUsuario: usuario[0].id,
    };
    // Creamos el token.
    const token = jwt.sign(tokenInfo, process.env.SECRET, {
      expiresIn: "5d",
    });

    const [idGrupo] = await connection.query(
      `select * from grupos_usuarios where id_usuario=?`,
      usuario[0].id
    );

    let [groups] = await connection.query(`select * from grupos`);

    let grupos = [];

    idGrupo.map((group) => {
      for (let i = 0; i < groups.length; i++) {
        if (group.id_grupo === groups[i].id) {
          groups[i] = { ...groups[i], admin: group.admin };
          grupos = [...grupos, groups[i]];
        }
      }
    });

    const [notas] = await connection.query(
      `select * from notas where id_usuario = ?`,
      usuario[0].id
    );

    res.send({
      status: "ok",
      data: {
        id: usuario[0].id,
        email,
        alias: usuario[0].alias,
        password,
        avatar: usuario[0].avatar,
        token,
        grupos,
        notas,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = loginUsuario;
