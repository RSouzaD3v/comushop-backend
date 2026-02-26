import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CompanyRepository } from "./repositories/company.repository";
import { StoreFollowRepository } from "./repositories/store-follow.repository";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { S3Service } from "../storage/s3.service";

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companyRepo: CompanyRepository,
    private readonly storeFollowRepo: StoreFollowRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepo.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException("Slug already in use");
    }
    return await this.companyRepo.create({
      name: dto.name,
      slug: dto.slug,
    });
  }

  async list() {
    return await this.companyRepo.list();
  }

  async listWithDetails(userId?: string) {
    const stores = await this.companyRepo.listWithDetails();

    if (!userId) {
      return stores;
    }

    // Add isFollowing flag for each store
    return Promise.all(
      stores.map(async (store) => ({
        ...store,
        isFollowing: await this.storeFollowRepo.isFollowing(userId, store.id),
      })),
    );
  }

  async getById(id: string) {
    const company = await this.companyRepo.findById(id);
    if (!company) throw new NotFoundException("Company not found");
    return company;
  }

  async getBySlug(slug: string, userId?: string) {
    const company = await this.companyRepo.findBySlugWithDetails(slug);
    if (!company) throw new NotFoundException("Loja não encontrada");

    const result: any = {
      ...company,
      followerCount: company._count?.followers ?? 0,
    };

    if (userId) {
      result.isFollowing = await this.storeFollowRepo.isFollowing(
        userId,
        company.id,
      );
    }

    delete result._count;

    return result;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.getById(id);

    if (dto.slug) {
      const existing = await this.companyRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException("Slug already in use");
      }
    }

    return await this.companyRepo.update(id, dto);
  }

  async uploadLogo(
    companyId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const company = await this.getById(companyId);

    // Delete old logo if exists
    if (company.logoUrl) {
      const oldKey = company.logoUrl
        .split(`${process.env.AWS_REGION}`)
        .pop()
        ?.replace("amazonaws.com/", "");
      if (oldKey) {
        await this.s3Service.deleteObject(oldKey);
      }
    }

    const { url } = await this.s3Service.uploadCompanyLogo(companyId, file);

    return await this.companyRepo.update(companyId, { logoUrl: url });
  }

  async deleteLogo(companyId: string) {
    const company = await this.getById(companyId);

    if (company.logoUrl) {
      const oldKey = company.logoUrl
        .split(`${process.env.AWS_REGION}`)
        .pop()
        ?.replace("amazonaws.com/", "");
      if (oldKey) {
        await this.s3Service.deleteObject(oldKey);
      }
    }

    return await this.companyRepo.update(companyId, { logoUrl: null });
  }

  async followStore(userId: string, storeId: string) {
    await this.getById(storeId);
    return await this.storeFollowRepo.followStore(userId, storeId);
  }

  async unfollowStore(userId: string, storeId: string) {
    await this.getById(storeId);
    await this.storeFollowRepo.unfollowStore(userId, storeId);
  }

  async isFollowing(userId: string, storeId: string) {
    return await this.storeFollowRepo.isFollowing(userId, storeId);
  }

  async getStoreReviews(
    storeId: string,
    params: { page?: number; limit?: number } = {},
  ) {
    await this.getById(storeId);
    return await this.companyRepo.getStoreReviews(storeId, params);
  }

  async getStoreFollowers(storeId: string) {
    await this.getById(storeId);
    return await this.storeFollowRepo.getStoreFollowers(storeId);
  }

  async getUserFollowing(userId: string) {
    return await this.storeFollowRepo.getUserFollowing(userId);
  }
}
