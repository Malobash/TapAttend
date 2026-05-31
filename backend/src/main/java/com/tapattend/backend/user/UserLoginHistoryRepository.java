package com.tapattend.backend.user;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserLoginHistoryRepository extends JpaRepository<UserLoginHistoryEntity, Long> {

    @Query("""
	    select history
	    from UserLoginHistoryEntity history
	    join fetch history.user
	    where history.loginAt >= :start and history.loginAt < :end
	    order by history.loginAt asc
	    """)
    List<UserLoginHistoryEntity> findAllForPeriod(
	    @Param("start") LocalDateTime start,
	    @Param("end") LocalDateTime end
    );

	void deleteByUserId(Long userId);
}