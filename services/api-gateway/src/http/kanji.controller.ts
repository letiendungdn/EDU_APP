import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import {
  CONTENT_PATTERNS,
  CreateKanjiVocabDto,
  ReorderKanjiVocabDto,
  UpdateKanjiVocabDto,
} from "@app/contracts";
import { JwtAuthGuard, Public, Roles, RolesGuard } from "@app/common";

@ApiTags("kanji")
@Controller("api")
export class KanjiController {
  constructor(
    @Inject("CONTENT_SERVICE") private readonly contentClient: ClientProxy,
  ) {}

  @Get("kanji-lessons")
  @Public()
  @ApiOperation({ summary: "List kanji lessons" })
  findAllLessons() {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_LESSONS, {}),
    );
  }

  @Get("kanji")
  @Public()
  @ApiOperation({ summary: "List kanji entries" })
  findEntries(
    @Query("lessonNumber") lessonNumber?: string,
    @Query("q") q?: string,
    @Query("jlptLevel") jlptLevel?: string,
  ) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_ENTRIES, {
        lessonNumber: lessonNumber ? +lessonNumber : undefined,
        query: q?.trim() || undefined,
        jlptLevel: jlptLevel?.trim() || undefined,
      }),
    );
  }

  @Get("kanji/:id")
  @Public()
  @ApiOperation({ summary: "Get kanji entry by id" })
  findOne(@Param("id") id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.GET_KANJI_ENTRY, { id: +id }),
    );
  }

  @Post("kanji/:entryId/vocabularies")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add related vocabulary to a kanji entry (admin)" })
  createVocab(
    @Param("entryId") entryId: string,
    @Body() dto: CreateKanjiVocabDto,
  ) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.CREATE_KANJI_VOCAB, {
        kanjiEntryId: +entryId,
        dto,
      }),
    );
  }

  @Put("kanji/:entryId/vocabularies/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reorder related vocabularies (admin)" })
  reorderVocab(
    @Param("entryId") entryId: string,
    @Body() dto: ReorderKanjiVocabDto,
  ) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.REORDER_KANJI_VOCAB, {
        kanjiEntryId: +entryId,
        orderedIds: dto.orderedIds,
      }),
    );
  }

  @Patch("kanji-vocab/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update related vocabulary (admin)" })
  updateVocab(@Param("id") id: string, @Body() dto: UpdateKanjiVocabDto) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.UPDATE_KANJI_VOCAB, {
        id: +id,
        dto,
      }),
    );
  }

  @Delete("kanji-vocab/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete related vocabulary (admin)" })
  removeVocab(@Param("id") id: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.DELETE_KANJI_VOCAB, { id: +id }),
    );
  }
}
