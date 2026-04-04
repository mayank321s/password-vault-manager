import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const requestedOrganizationId = req.header('x-organization-id');

    if (!requestedOrganizationId) {
      next();
      return;
    }

    if (!UUID_REGEX.test(requestedOrganizationId)) {
      throw new BadRequestException('Invalid x-organization-id header');
    }

    (req as Request & { requestedOrganizationId?: string }).requestedOrganizationId =
      requestedOrganizationId;

    next();
  }
}
