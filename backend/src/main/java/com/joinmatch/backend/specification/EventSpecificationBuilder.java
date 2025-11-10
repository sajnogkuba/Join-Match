package com.joinmatch.backend.specification;

import com.joinmatch.backend.model.Event;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class EventSpecificationBuilder {

    public static Specification<Event> build(
            String name,
            Integer sportTypeId,
            String city,
            LocalDate dateFrom,
            LocalDate dateTo,
            Boolean free,
            Boolean available
    ) {
        Specification<Event> spec = Specification.where(null);

        if (name != null && !name.isBlank()) {
            spec = spec.and(nameContains(name));
        }

        if (sportTypeId != null) {
            spec = spec.and(sportTypeEquals(sportTypeId));
        }

        if (city != null && !city.isBlank()) {
            spec = spec.and(cityContains(city));
        }

        if (dateFrom != null) {
            spec = spec.and(dateAfterOrEqual(dateFrom));
        }

        if (dateTo != null) {
            spec = spec.and(dateBeforeOrEqual(dateTo));
        }

        if (free != null && free) {
            spec = spec.and(isFree());
        }

        if (available != null && available) {
            spec = spec.and(isAvailable());
        }

        return spec;
    }

    private static Specification<Event> nameContains(String name) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("eventName")), "%" + name.toLowerCase() + "%");
    }

    private static Specification<Event> sportTypeEquals(Integer sportTypeId) {
        return (root, query, cb) ->
                cb.equal(root.get("sportEv").get("id"), sportTypeId);
    }

    private static Specification<Event> cityContains(String city) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("sportObject").get("city")), "%" + city.toLowerCase() + "%");
    }

    private static Specification<Event> dateAfterOrEqual(LocalDate from) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("eventDate"), from);
    }

    private static Specification<Event> dateBeforeOrEqual(LocalDate to) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("eventDate"), to);
    }

    private static Specification<Event> isFree() {
        return (root, query, cb) ->
                cb.equal(root.get("cost"), 0);
    }

    private static Specification<Event> isAvailable() {
        return (root, query, cb) -> {
            query.distinct(true);

            var subquery = query.subquery(Long.class);
            var subRoot = subquery.from(com.joinmatch.backend.model.UserEvent.class);
            subquery.select(cb.count(subRoot));
            subquery.where(cb.equal(subRoot.get("event"), root));

            return cb.greaterThan(root.get("numberOfParticipants").as(Long.class), subquery);
        };
    }

}