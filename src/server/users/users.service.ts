import { prisma } from "../prisma/prisma.client";

/**
 * SERVICIO DE USUARIOS
 * 
 * Gestiona las operaciones relacionadas con el perfil del usuario,
 * como la selección de personajes y armas para las partidas.
 */
export class UsersService {
  /**
   * Actualiza el personaje seleccionado por el usuario.
   * Verifica que el personaje exista antes de asignarlo.
   */
  static async selectCharacter(userId: string, characterCode: string) {
    const character = await prisma.character.findUnique({
      where: { code: characterCode }
    });

    if (!character) {
      throw new Error(`El personaje con código ${characterCode} no existe.`);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { selectedCharacterId: character.code },
      select: { id: true, username: true, selectedCharacterId: true }
    });
  }

  /**
   * Actualiza el arma seleccionada por el usuario.
   * Verifica que el arma exista antes de asignarla.
   */
  static async selectWeapon(userId: string, weaponCode: string) {
    const weapon = await prisma.weapon.findUnique({
      where: { code: weaponCode }
    });

    if (!weapon) {
      throw new Error(`El arma con código ${weaponCode} no existe.`);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { selectedWeaponId: weapon.code },
      select: { id: true, username: true, selectedWeaponId: true }
    });
  }
}
