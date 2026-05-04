package ma.sirmaroc.matchs.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExternalMatchResponse {
    private Integer id;
    private String competition;
    private String utcDate;
    private String status;
    private String stage;
    private Integer matchday;
    private String venue;
    private String homeTeam;
    private String awayTeam;
    private String score;
}
