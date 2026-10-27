import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const BCRYPT_COST = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.existsBy({ email: dto.email })) {
      throw new ConflictException('El correo ya está registrado');
    }
    const password = await bcrypt.hash(dto.password, BCRYPT_COST);
    const saved = await this.users.save(
      this.users.create({
        name: dto.name,
        email: dto.email,
        role: dto.role,
        password,
      }),
    );
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }

  async login(dto: LoginDto) {
    // El hash está en select:false; se pide explícitamente solo aquí.
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();
    // Mismo mensaje si el correo no existe o la clave falla: no revela cuentas.
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async me(id: number) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
