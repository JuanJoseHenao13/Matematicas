"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
/**
 * SERVICIO DE USUARIOS
 *
 * Gestiona las operaciones relacionadas con el perfil del usuario,
 * como la selección de personajes y armas para las partidas.
 */
class UsersService {
    /**
     * Actualiza el personaje seleccionado por el usuario.
     * Verifica que el personaje exista antes de asignarlo.
     */
    static async selectCharacter(userId, characterCode) {
        const character = await prisma_client_1.prisma.character.findUnique({
            where: { code: characterCode }
        });
        if (!character) {
            throw new Error(`El personaje con código ${characterCode} no existe.`);
        }
        return prisma_client_1.prisma.user.update({
            where: { id: userId },
            data: { selectedCharacterId: character.code },
            select: { id: true, username: true, selectedCharacterId: true }
        });
    }
    /**
     * Actualiza el arma seleccionada por el usuario.
     * Verifica que el arma exista antes de asignarla.
     */
    static async selectWeapon(userId, weaponCode) {
        const weapon = await prisma_client_1.prisma.weapon.findUnique({
            where: { code: weaponCode }
        });
        if (!weapon) {
            throw new Error(`El arma con código ${weaponCode} no existe.`);
        }
        return prisma_client_1.prisma.user.update({
            where: { id: userId },
            data: { selectedWeaponId: weapon.code },
            select: { id: true, username: true, selectedWeaponId: true }
        });
    }
}
exports.UsersService = UsersService;
