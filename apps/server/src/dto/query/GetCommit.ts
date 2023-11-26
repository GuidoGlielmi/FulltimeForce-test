import { IsNumber, IsOptional, Min } from 'class-validator';

export class GetCommitQueryDTO {
  @IsOptional()
  @IsNumber()
  @Min(0)
  public per_page?: number;

  @IsNumber()
  @Min(0)
  public page: number;
}
