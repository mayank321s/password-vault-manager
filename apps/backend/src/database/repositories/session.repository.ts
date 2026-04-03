import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Session } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(@InjectModel(Session) model: typeof Session) {
    super(model);
  }
}
