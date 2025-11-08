package com.joinmatch.backend.specification;

import com.joinmatch.backend.model.Team;
import org.springframework.data.jpa.domain.Specification;

public class TeamSpecificationBuilder {

    public static Specification<Team> build(String name, Integer sportTypeId, String leaderName) {
        Specification<Team> spec = Specification.where(null);

        if (name != null && !name.isBlank()) {
            spec = spec.and(nameContains(name));
        }

        if (sportTypeId != null) {
            spec = spec.and(sportTypeEquals(sportTypeId));
        }

        if (leaderName != null && !leaderName.isBlank()) {
            spec = spec.and(leaderNameContains(leaderName));
        }

        return spec;
    }

    private static Specification<Team> nameContains(String name) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    private static Specification<Team> sportTypeEquals(Integer sportTypeId) {
        return (root, query, cb) ->
                cb.equal(root.get("sportType").get("id"), sportTypeId);
    }

    private static Specification<Team> leaderNameContains(String leaderName) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("leader").get("name")), "%" + leaderName.toLowerCase() + "%");
    }
}